export type ExpertiseTheme = "depth" | "radar" | "matrix" | "panels";

export type ExpertisePage = {
  slug: string;
  index: string;
  navTitle: string;
  title: string;
  heroLines: [string, string];
  summary: string;
  lead: string;
  image: string;
  imageAlt: string;
  illustration: string;
  illustrationAlt: string;
  theme: ExpertiseTheme;
  tags: string[];
  statement: string;
  overviewTitle: string;
  overviewBody: string;
  services: Array<{
    index: string;
    title: string;
    text: string;
    items: string[];
    result: string;
  }>;
  focus: {
    title: string;
    body: string;
    points: Array<{
      title: string;
      text: string;
    }>;
  };
  outcomes: Array<{
    title: string;
    text: string;
  }>;
  process: Array<{
    index: string;
    title: string;
    text: string;
  }>;
  nextSlug: string;
};

export const expertisePages: ExpertisePage[] = [
  {
    slug: "datacenter-cloud",
    index: "01",
    navTitle: "Datacenter & Cloud",
    title: "Datacenter, Cloud & Productivité",
    heroLines: ["Des infrastructures", "prêtes pour la suite."],
    summary: "Des infrastructures performantes, sécurisées et dimensionnées pour vos enjeux actuels comme pour votre croissance.",
    lead: "Nous concevons le socle qui porte vos applications, protège vos données et accompagne l’évolution de votre organisation.",
    image: "/images/datacenter.webp",
    imageAlt: "Salle datacenter éclairée en cyan",
    illustration: "/images/expertises/datacenter-operations-v3.webp",
    illustrationAlt: "Ingénieur contrôlant les équipements dans une allée de datacenter",
    theme: "depth",
    tags: ["Datacenter", "Cloud hybride", "Supervision"],
    statement: "Chaque composant est pensé pour la disponibilité, la continuité et l’évolution de votre système d’information.",
    overviewTitle: "Un socle fiable pour vos opérations critiques",
    overviewBody: "Du datacenter sur site au cloud hybride, INOX Technologies réunit architecture, déploiement et pilotage. Nous adaptons chaque environnement à vos usages, à vos contraintes de sécurité et au niveau de disponibilité attendu.",
    services: [
      {
        index: "01",
        title: "Infrastructures datacenter nouvelle génération",
        text: "Nous concevons le socle physique et virtualisé à partir des charges réelles, des dépendances métier et des objectifs de disponibilité. Le dimensionnement couvre les besoins immédiats sans fermer la voie aux évolutions futures.",
        items: ["Calcul, stockage et virtualisation", "Architecture haute disponibilité", "Modernisation des environnements existants"],
        result: "Une plateforme plus stable, documentée et prête à absorber la croissance des usages.",
      },
      {
        index: "02",
        title: "Sécurité et continuité d’activité",
        text: "Nous organisons la protection des données et la reprise des services selon leur niveau de criticité. Les scénarios sont documentés, testables et pensés pour ramener l’activité à un état maîtrisé.",
        items: ["Sauvegarde et restauration", "Plans de continuité et de reprise", "Résilience des composants critiques"],
        result: "Des données récupérables et des responsabilités claires lorsqu’un incident survient.",
      },
      {
        index: "03",
        title: "Cloud et environnements hybrides",
        text: "Nous évaluons les contraintes de chaque application avant de choisir entre infrastructure locale, cloud privé, cloud public ou modèle hybride. La migration est séquencée afin de préserver les opérations.",
        items: ["Cadrage de la trajectoire cloud", "Migration et intégration", "Gestion des services cloud"],
        result: "Une trajectoire cloud lisible, sans déplacement de complexité ni dépendance inutile.",
      },
      {
        index: "04",
        title: "Pilotage et optimisation",
        text: "Les indicateurs techniques sont transformés en informations exploitables : capacité, disponibilité, alertes et tendances. Les équipes savent où agir avant qu’une dégradation n’affecte les utilisateurs.",
        items: ["Supervision proactive", "Alerting et tableaux de bord", "Optimisation des ressources"],
        result: "Des décisions d’exploitation fondées sur l’état réel de la plateforme.",
      },
    ],
    focus: {
      title: "La continuité d’activité avant la seule puissance technique",
      body: "Une infrastructure performante doit rester compréhensible, testable et exploitable au quotidien. Sa fiabilité dépend autant du dimensionnement que de la sauvegarde, de la supervision, de la documentation et de la capacité à reprendre rapidement.",
      points: [
        { title: "Dimensionnement utile", text: "Aligner les ressources sur les charges actuelles et les évolutions prévues, sans surinvestissement." },
        { title: "Architecture sans point aveugle", text: "Identifier les dépendances critiques et prévoir les mécanismes de redondance adaptés." },
        { title: "Reprise vérifiable", text: "Définir les priorités de restauration et éprouver les scénarios avant l’incident." },
        { title: "Exploitation lisible", text: "Centraliser les alertes, les capacités et la documentation pour accélérer les décisions." },
      ],
    },
    outcomes: [
      { title: "Disponibilité", text: "Réduire les interruptions et sécuriser les opérations essentielles." },
      { title: "Évolutivité", text: "Faire grandir l’infrastructure sans reconstruire son socle." },
      { title: "Visibilité", text: "Piloter la capacité et les performances avec des indicateurs utiles." },
      { title: "Continuité", text: "Préparer la sauvegarde, la reprise et le retour à la normale." },
    ],
    process: [
      { index: "01", title: "Diagnostic", text: "Cartographie de l’existant, des dépendances et des exigences de disponibilité." },
      { index: "02", title: "Architecture", text: "Conception de la cible, dimensionnement et choix des composants." },
      { index: "03", title: "Déploiement", text: "Installation, migration, tests et documentation de l’environnement." },
      { index: "04", title: "Pilotage", text: "Supervision, optimisation et évolution continue de la plateforme." },
    ],
    nextSlug: "reseaux-securite",
  },
  {
    slug: "reseaux-securite",
    index: "02",
    navTitle: "Réseaux & Sécurité",
    title: "Réseaux & Sécurité",
    heroLines: ["Un réseau qui tient.", "Une sécurité qui anticipe."],
    summary: "Des réseaux résilients et une sécurité multicouche pour protéger vos données, vos accès et la continuité de vos services.",
    lead: "Nous relions vos équipes et vos environnements tout en réduisant la surface d’exposition de votre système d’information.",
    image: "/images/security.webp",
    imageAlt: "Interface symbolisant la protection d’un réseau informatique",
    illustration: "/images/expertises/security-operations-v3.webp",
    illustrationAlt: "Analystes surveillant les événements de cybersécurité dans un centre opérationnel",
    theme: "radar",
    tags: ["Cybersécurité", "Réseaux", "Continuité"],
    statement: "La sécurité se construit dans l’architecture, se vérifie dans les usages et se maintient dans le temps.",
    overviewTitle: "Connecter l’activité sans ouvrir de nouvelles failles",
    overviewBody: "INOX Technologies conçoit des réseaux stables, tolérants aux pannes et capables d’évoluer. La sécurité intervient à chaque niveau, des accès aux équipements, avec une surveillance continue et une réponse structurée aux incidents.",
    services: [
      {
        index: "01",
        title: "Conception de réseaux performants",
        text: "Nous partons des flux métier, des sites, des profils utilisateurs et des applications pour construire une topologie claire. La performance, la couverture et les mécanismes de secours sont validés ensemble.",
        items: ["Architecture LAN, WAN et Wi-Fi", "Résilience et tolérance aux pannes", "Segmentation et qualité de service"],
        result: "Une connectivité stable qui priorise les usages importants et limite l’impact des pannes.",
      },
      {
        index: "02",
        title: "Sécurité de nouvelle génération",
        text: "La défense est répartie entre le réseau, les terminaux, les identités et les accès sensibles. Cette approche réduit les chemins d’attaque et évite de dépendre d’un contrôle unique.",
        items: ["Protection périmétrique et réseau", "EDR et XDR", "Gestion des identités et accès privilégiés"],
        result: "Des contrôles cohérents qui protègent l’utilisateur jusqu’à la donnée.",
      },
      {
        index: "03",
        title: "Supervision et réactivité",
        text: "Nous organisons la collecte, la qualification et l’escalade des événements afin de distinguer rapidement le bruit d’une alerte réelle. Chaque incident suit un circuit de traitement traçable.",
        items: ["Monitoring des équipements", "Alerting et qualification", "Traitement des incidents"],
        result: "Une détection plus précoce et une réponse coordonnée lorsque le risque se confirme.",
      },
      {
        index: "04",
        title: "Évaluation et amélioration",
        text: "Les audits relient les faiblesses techniques à leur impact potentiel sur l’activité. Le plan de remédiation hiérarchise les actions selon le risque, l’effort et les dépendances.",
        items: ["Audits de vulnérabilité", "Revue des configurations", "Plan de remédiation"],
        result: "Une feuille de route sécurité priorisée, réaliste et mesurable.",
      },
    ],
    focus: {
      title: "Protéger les accès tout en maintenant la fluidité des échanges",
      body: "Une sécurité intégrée au réseau et aux usages réduit l’exposition sans freiner les accès légitimes. Elle rend les anomalies visibles et donne aux équipes un mode opératoire clair pour qualifier, contenir et traiter chaque incident.",
      points: [
        { title: "Segmentation maîtrisée", text: "Limiter les mouvements latéraux et isoler les environnements selon leur criticité." },
        { title: "Identités sous contrôle", text: "Appliquer le moindre privilège et renforcer les accès administrateurs et distants." },
        { title: "Signaux qualifiés", text: "Corréler les événements pertinents pour concentrer l’attention sur les menaces réelles." },
        { title: "Réponse préparée", text: "Définir les rôles, les étapes d’escalade et les premières mesures de confinement." },
      ],
    },
    outcomes: [
      { title: "Résilience", text: "Maintenir les communications malgré une panne ou une dégradation." },
      { title: "Maîtrise des accès", text: "Appliquer le bon niveau de contrôle à chaque profil." },
      { title: "Détection", text: "Identifier plus tôt les comportements et événements suspects." },
      { title: "Réaction", text: "Organiser la prise en charge et réduire le temps d’exposition." },
    ],
    process: [
      { index: "01", title: "Cartographier", text: "Comprendre les flux, les accès, les actifs et les points de dépendance." },
      { index: "02", title: "Prioriser", text: "Classer les risques et définir les mesures adaptées à l’activité." },
      { index: "03", title: "Sécuriser", text: "Déployer les contrôles, tester les règles et documenter les usages." },
      { index: "04", title: "Surveiller", text: "Observer, ajuster et traiter les alertes selon leur criticité." },
    ],
    nextSlug: "digitalisation-logiciels",
  },
  {
    slug: "digitalisation-logiciels",
    index: "03",
    navTitle: "Digitalisation & Logiciels",
    title: "Digitalisation, Développement & Intégration",
    heroLines: ["Des outils conçus", "autour de vos métiers."],
    summary: "Des applications web, desktop et mobiles conçues pour simplifier vos processus et connecter vos systèmes existants.",
    lead: "Nous transformons les besoins opérationnels en expériences numériques claires, intégrées et faciles à faire évoluer.",
    image: "/images/digital.webp",
    imageAlt: "Professionnel utilisant une interface numérique sur ordinateur",
    illustration: "/images/expertises/digital-workshop-v3.webp",
    illustrationAlt: "Équipe produit travaillant ensemble sur le prototype d’une application métier",
    theme: "matrix",
    tags: ["Sur mesure", "Intégration", "Interopérabilité"],
    statement: "Un bon logiciel épouse les réalités du terrain, simplifie les décisions et reste ouvert aux évolutions futures.",
    overviewTitle: "Le numérique au service des processus métier",
    overviewBody: "Nous partons des usages réels avant de définir la solution. Cette approche permet de digitaliser les étapes utiles, d’intégrer l’existant et de livrer des applications qui trouvent naturellement leur place dans le quotidien des équipes.",
    services: [
      {
        index: "01",
        title: "Digitalisation des processus",
        text: "Nous observons les étapes, les validations, les documents et les ressaisies qui ralentissent les opérations. La digitalisation cible d’abord les points où elle crée un gain concret pour les équipes.",
        items: ["Analyse des processus", "Automatisation des tâches", "Interfaces de pilotage"],
        result: "Des parcours raccourcis, des responsabilités visibles et moins de manipulations manuelles.",
      },
      {
        index: "02",
        title: "Développement sur mesure",
        text: "Chaque solution est structurée autour des rôles, des règles métier et du contexte d’utilisation. Les choix d’interface et d’architecture restent cohérents avec la capacité d’exploitation de l’organisation.",
        items: ["Applications métier", "Portails et espaces de service", "Solutions mobiles"],
        result: "Un outil réellement adapté au terrain, plus simple à adopter et à faire évoluer.",
      },
      {
        index: "03",
        title: "Intégration et interopérabilité",
        text: "Nous organisons les échanges entre applications, référentiels et partenaires afin que la donnée circule au bon moment. Les interfaces sont sécurisées, documentées et conçues pour limiter les doublons.",
        items: ["Connexion aux outils existants", "API et échanges de données", "Synchronisation des référentiels"],
        result: "Une information plus cohérente et disponible sans ressaisie entre les systèmes.",
      },
      {
        index: "04",
        title: "Évolution applicative",
        text: "Après la mise en service, nous suivons les usages, les irritants et les nouvelles priorités. La feuille de route applicative permet d’améliorer le produit sans fragiliser ce qui fonctionne déjà.",
        items: ["Maintenance évolutive", "Optimisation de l’expérience", "Accompagnement au changement"],
        result: "Une solution qui progresse avec les métiers au lieu de devenir une nouvelle contrainte.",
      },
    ],
    focus: {
      title: "L’usage métier comme point de départ de chaque décision",
      body: "La clarté des parcours, la qualité de la donnée et l’appropriation par les utilisateurs guident chaque décision. La solution répond à un problème opérationnel identifiable, s’intègre à l’existant et peut évoluer sans rupture.",
      points: [
        { title: "Processus observés", text: "Comprendre le travail réel, y compris les exceptions et les contournements du quotidien." },
        { title: "Prototype partagé", text: "Valider tôt les parcours et le vocabulaire avec les futurs utilisateurs." },
        { title: "Donnée connectée", text: "Éviter les silos grâce à des échanges structurés avec les outils déjà en place." },
        { title: "Adoption accompagnée", text: "Préparer les équipes, documenter les usages et intégrer leurs retours après lancement." },
      ],
    },
    outcomes: [
      { title: "Simplicité", text: "Réduire les étapes inutiles et rendre les parcours plus lisibles." },
      { title: "Cohérence", text: "Faire circuler les données entre les outils et les équipes." },
      { title: "Adoption", text: "Concevoir des interfaces adaptées aux habitudes de travail." },
      { title: "Évolution", text: "Faire progresser la solution avec les besoins de l’organisation." },
    ],
    process: [
      { index: "01", title: "Comprendre", text: "Observer les usages, formaliser les besoins et identifier les irritants." },
      { index: "02", title: "Prototyper", text: "Valider rapidement les parcours, l’information et les interactions." },
      { index: "03", title: "Construire", text: "Développer, intégrer et tester avec les équipes concernées." },
      { index: "04", title: "Améliorer", text: "Mesurer l’usage, corriger et enrichir la solution dans le temps." },
    ],
    nextSlug: "formation-infogerance",
  },
  {
    slug: "formation-infogerance",
    index: "04",
    navTitle: "Formation & Support",
    title: "Formation, Infogérance & Support",
    heroLines: ["Votre équipe avance.", "Votre SI reste opérationnel."],
    summary: "Nos experts renforcent vos équipes, maintiennent votre SI et prennent en charge les opérations qui vous éloignent de votre cœur de métier.",
    lead: "Nous transmettons les compétences utiles et apportons le renfort opérationnel nécessaire au bon fonctionnement de votre environnement IT.",
    image: "/images/team.webp",
    imageAlt: "Équipe informatique collaborant devant des écrans",
    illustration: "/images/expertises/support-training-v3.webp",
    illustrationAlt: "Expert informatique accompagnant une équipe pendant une session pratique",
    theme: "panels",
    tags: ["Formation", "Support", "Infogérance"],
    statement: "Le support devient réellement utile lorsqu’il résout l’incident, documente la réponse et fait progresser l’équipe.",
    overviewTitle: "Des compétences disponibles au bon moment",
    overviewBody: "Formation ciblée, support technique ou prise en charge d’un périmètre complet : notre intervention s’adapte à votre organisation. Vos équipes restent concentrées sur leurs priorités tout en bénéficiant d’un appui technique structuré.",
    services: [
      {
        index: "01",
        title: "Montée en compétence des équipes",
        text: "Les contenus sont adaptés aux outils réellement utilisés, au niveau des participants et aux situations rencontrées. La pratique, les cas concrets et les supports réutilisables facilitent l’appropriation.",
        items: ["Programmes spécialisés", "Sessions animées par des experts", "Transfert de compétences"],
        result: "Des équipes plus autonomes, capables d’appliquer rapidement les acquis dans leur contexte.",
      },
      {
        index: "02",
        title: "Externalisation de la gestion du SI",
        text: "Nous définissons précisément le périmètre, les responsabilités, les niveaux de service et les points de contrôle. Les opérations récurrentes sont exécutées et suivies selon un cadre partagé.",
        items: ["Gestion des systèmes", "Gestion des licences et actifs", "Pilotage des services cloud"],
        result: "Une exploitation plus régulière et du temps rendu aux équipes internes.",
      },
      {
        index: "03",
        title: "Support technique",
        text: "Les demandes sont qualifiées, priorisées puis prises en charge au niveau d’expertise approprié. Le suivi conserve le contexte, les actions menées et la solution retenue.",
        items: ["Support niveaux 2 et 3", "Escalade et suivi", "Documentation des interventions"],
        result: "Des incidents traités avec méthode et une connaissance qui ne se perd pas après résolution.",
      },
      {
        index: "04",
        title: "Maintenance du système d’information",
        text: "La maintenance combine contrôles préventifs, corrections et évolutions planifiées. Elle réduit les dégradations silencieuses et évite que les changements urgents deviennent la norme.",
        items: ["Maintenance préventive", "Maintenance corrective", "Maintenance évolutive"],
        result: "Un système d’information plus prévisible, suivi et durable.",
      },
    ],
    focus: {
      title: "Faire du support un levier de continuité et de progression",
      body: "La proximité, la traçabilité et le transfert de connaissances donnent au support une valeur durable. Chaque intervention vise à rétablir le service, expliquer la cause et réduire la probabilité que le même problème mobilise à nouveau vos équipes.",
      points: [
        { title: "Périmètre sans ambiguïté", text: "Définir qui intervient, sur quoi, selon quelle priorité et dans quels délais." },
        { title: "Connaissance capitalisée", text: "Documenter les diagnostics et les solutions pour accélérer les prochaines prises en charge." },
        { title: "Compétences transmises", text: "Faire progresser les équipes grâce aux cas concrets rencontrés pendant l’exploitation." },
        { title: "Amélioration continue", text: "Analyser les incidents récurrents et traiter leurs causes plutôt que leurs seuls symptômes." },
      ],
    },
    outcomes: [
      { title: "Autonomie", text: "Donner aux équipes les repères nécessaires pour agir efficacement." },
      { title: "Disponibilité", text: "Accéder à l’expertise adaptée lorsque la situation l’exige." },
      { title: "Concentration", text: "Réduire la charge opérationnelle qui éloigne du cœur de métier." },
      { title: "Progression", text: "Capitaliser sur chaque intervention et améliorer les pratiques." },
    ],
    process: [
      { index: "01", title: "Cadrer", text: "Définir le périmètre, les responsabilités et les niveaux de service." },
      { index: "02", title: "Organiser", text: "Mettre en place les canaux, les procédures et les points de suivi." },
      { index: "03", title: "Accompagner", text: "Intervenir, transmettre et documenter les solutions apportées." },
      { index: "04", title: "Faire progresser", text: "Analyser les demandes récurrentes et proposer des améliorations." },
    ],
    nextSlug: "datacenter-cloud",
  },
];

export function getExpertise(slug: string) {
  return expertisePages.find((expertise) => expertise.slug === slug);
}
