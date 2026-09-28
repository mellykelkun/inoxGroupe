"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LIBELLES_CATEGORIES = {
  general: "Discussion générale",
  conseil: "Conseil & expertise",
  support: "Support technique",
  projet: "Projet numérique",
};

const ANGLE_DORE = Math.PI * (3 - Math.sqrt(5));

function positionSujet(index) {
  const angle = index * ANGLE_DORE - Math.PI / 2;
  const rayon = 54 + Math.sqrt(index + 1) * 32;
  return {
    angle,
    x: Math.round(340 + Math.cos(angle) * rayon),
    y: Math.round(Math.min(365, Math.max(48, 205 + Math.sin(angle) * rayon * .66))),
  };
}

function positionReponse(position, index, total) {
  const ecart = total === 1 ? 0 : (index - (total - 1) / 2) * .95;
  const angle = position.angle + Math.PI / 2 + ecart;
  const distance = 20 + Math.floor(index / 4) * 8;
  return {
    x: Math.round(position.x + Math.cos(angle) * distance),
    y: Math.round(position.y + Math.sin(angle) * distance),
  };
}

function raccourcir(texte, longueur = 29) {
  if (!texte || texte.length <= longueur) return texte;
  return `${texte.slice(0, longueur - 1).trim()}…`;
}

function organiserMessages(messages) {
  const reponsesParFil = new Map();
  messages.filter((message) => message.parent_id !== null).forEach((message) => {
    const reponses = reponsesParFil.get(message.thread_id) || [];
    reponses.push(message);
    reponsesParFil.set(message.thread_id, reponses);
  });
  reponsesParFil.forEach((reponses) => reponses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));

  return messages
    .filter((message) => message.parent_id === null)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((discussion) => ({
      ...discussion,
      reponses: reponsesParFil.get(discussion.id) || [],
    }));
}

function ArbreForum({ discussions }) {
  const nombreReponses = discussions.reduce((total, discussion) => total + discussion.reponses.length, 0);
  const croissance = Math.min(1, .34 + discussions.length * .1 + nombreReponses * .025);
  const graphe = discussions.map((discussion, index) => {
    const position = positionSujet(index);
    return {
      discussion,
      position,
      reponses: discussion.reponses.map((reponse, reponseIndex) => ({
        reponse,
        position: positionReponse(position, reponseIndex, discussion.reponses.length),
      })),
    };
  });

  return (
    <div className="arbreForum" style={{ "--croissance-arbre": croissance }}>
      <div className="arbreForum__compteurs">
        <span><strong>{discussions.length}</strong> {discussions.length > 1 ? "sujets" : "sujet"}</span>
        <span><strong>{nombreReponses}</strong> {nombreReponses > 1 ? "réponses" : "réponse"}</span>
      </div>
      <svg viewBox="0 0 680 520" role="img" aria-label={`Arbre du Forum INOX : ${discussions.length} sujets et ${nombreReponses} réponses`}>
        <defs>
          <linearGradient id="tronc-forum" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#0a3158" />
            <stop offset="1" stopColor="#2786d9" />
          </linearGradient>
          <filter id="lueur-forum" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="flou" />
            <feMerge><feMergeNode in="flou" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className="arbreForum__racines">
          <path d="M340 454 C298 461 264 482 226 501" />
          <path d="M340 454 C379 465 410 482 457 501" />
          <path d="M340 463 C323 481 310 495 300 510" />
          <path d="M340 463 C356 482 370 496 382 510" />
        </g>
        <path className="arbreForum__tronc" d="M340 466 C330 405 354 354 337 305 C319 255 353 213 340 158 C335 132 340 109 349 83" />
        <path className="arbreForum__brancheFixe arbreForum__brancheFixe--gauche" d="M338 309 C294 290 261 260 231 222" />
        <path className="arbreForum__brancheFixe arbreForum__brancheFixe--droite" d="M342 261 C386 247 418 213 447 172" />

        {graphe.map(({ discussion, position, reponses }, index) => {
          const departY = Math.min(390, Math.max(155, position.y + 62));
          const controleX = Math.round(340 + (position.x - 340) * .48);
          const controleY = Math.round((departY + position.y) / 2);
          const texteX = position.x < 340 ? position.x - 13 : position.x + 13;
          const ancrage = position.x < 340 ? "end" : "start";
          return (
            <g className="arbreForum__discussion" key={discussion.id} style={{ "--delai-branche": `${Math.min(index, 12) * 55}ms` }}>
              <path className="arbreForum__liaisonSujet" d={`M340 ${departY} Q${controleX} ${controleY} ${position.x} ${position.y}`} />

              {reponses.map(({ reponse, position: positionFeuille }) => (
                <a
                  className="arbreForum__lienReponse"
                  href={`/forum#message-${reponse.id}`}
                  aria-label={`Lire la réponse de ${reponse.display_name}`}
                  key={reponse.id}
                >
                  <line x1={position.x} y1={position.y} x2={positionFeuille.x} y2={positionFeuille.y} />
                  <circle cx={positionFeuille.x} cy={positionFeuille.y} r="4" />
                  <text
                    className="arbreForum__infobulle"
                    x={positionFeuille.x < 340 ? positionFeuille.x - 8 : positionFeuille.x + 8}
                    y={positionFeuille.y - 7}
                    textAnchor={positionFeuille.x < 340 ? "end" : "start"}
                  >
                    {raccourcir(`${reponse.display_name} — ${reponse.body}`, 36)}
                  </text>
                  <title>{`Réponse de ${reponse.display_name} : ${reponse.body}`}</title>
                </a>
              ))}

              <a
                className="arbreForum__lienSujet"
                href={`/forum#discussion-${discussion.id}`}
                aria-label={`Ouvrir le sujet : ${discussion.subject}`}
              >
                <circle className="arbreForum__noeud" cx={position.x} cy={position.y} r={index < 8 ? "8" : "6"} />
                <text
                  className={`arbreForum__infobulle ${index < 8 ? "arbreForum__infobulle--visible" : ""}`}
                  x={texteX}
                  y={position.y - 9}
                  textAnchor={ancrage}
                >
                  {raccourcir(discussion.subject, 31)}
                </text>
                <title>{`${discussion.subject} — ${discussion.reponses.length} ${discussion.reponses.length > 1 ? "réponses" : "réponse"}`}</title>
              </a>
            </g>
          );
        })}

        {graphe.length === 0 && (
          <g className="arbreForum__graine">
            <circle cx="340" cy="351" r="9" />
            <path d="M340 351 C314 339 302 321 297 298" />
            <path d="M340 351 C363 336 377 317 382 293" />
            <text x="340" y="267" textAnchor="middle">Votre question fera naître la première branche</text>
          </g>
        )}
      </svg>
      {graphe.length === 0 && <p className="arbreForum__appelInitial">Votre question fera naître la première branche.</p>}
      <div className="arbreForum__socle"><span>INOX</span><small>Les échanges font grandir la connaissance.</small></div>
    </div>
  );
}

export default function ForumAccueil() {
  const [messages, setMessages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [pause, setPause] = useState(false);
  const piste = useRef(null);

  const charger = useCallback(async () => {
    try {
      const reponse = await fetch("/api/forum/messages", { cache: "no-store" });
      if (!reponse.ok) return;
      const resultat = await reponse.json();
      setMessages(resultat.messages || []);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
    const actualisation = window.setInterval(charger, 60_000);
    return () => window.clearInterval(actualisation);
  }, [charger]);

  const discussions = useMemo(() => organiserMessages(messages), [messages]);

  const avancer = useCallback((direction = 1) => {
    const element = piste.current;
    if (!element) return;
    const pas = Math.min(430, element.clientWidth * .82) * direction;
    const finAtteinte = element.scrollLeft + element.clientWidth >= element.scrollWidth - 12;
    const debutAtteint = element.scrollLeft <= 12;
    element.scrollTo({
      left: direction > 0 && finAtteinte ? 0 : direction < 0 && debutAtteint ? element.scrollWidth : element.scrollLeft + pas,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    if (pause || discussions.length < 2) return undefined;
    const defilement = window.setInterval(() => avancer(1), 5_500);
    return () => window.clearInterval(defilement);
  }, [avancer, discussions.length, pause]);

  return (
    <section className="section forumAccueil" id="forum" aria-labelledby="forum-accueil-titre">
      <div className="forumAccueil__halo" aria-hidden="true" />
      <div className="conteneur forumAccueil__entete">
        <div>
          <span className="eyebrow">Le Forum INOX grandit avec vous</span>
          <h2 id="forum-accueil-titre">Une question partagée.<br /><em>Une connaissance qui s’étend.</em></h2>
        </div>
        <div className="forumAccueil__introduction">
          <p>Chaque sujet ouvre une branche. Chaque réponse ajoute une nouvelle feuille et aide d’autres entreprises à avancer plus vite.</p>
          <Link className="bouton bouton--accent" href="/forum">Rejoindre le Forum INOX <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="conteneur forumAccueil__coeur">
        <ArbreForum discussions={discussions} />
        <div className="forumAccueil__manifeste">
          <span>Un savoir vivant</span>
          <strong>L’arbre révèle les sujets qui rassemblent la communauté INOX.</strong>
          <p>Plus les visiteurs questionnent, partagent et répondent, plus sa ramure devient riche. Touchez une bulle pour ouvrir directement son sujet ou sa réponse dans le Forum.</p>
          <Link href="/forum">Faire grandir l’arbre avec votre question <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <div className="forumAccueil__flux">
        <div className="conteneur forumAccueil__fluxEntete">
          <div><span>Discussions en cours</span><strong>Sujets et réponses, dans leur ordre de lecture</strong></div>
          <div className="forumAccueil__commandes">
            <button type="button" onClick={() => avancer(-1)} aria-label="Voir les discussions précédentes">←</button>
            <button type="button" onClick={() => avancer(1)} aria-label="Voir les discussions suivantes">→</button>
          </div>
        </div>
        <div
          className="forumAccueil__piste"
          ref={piste}
          tabIndex="0"
          role="region"
          aria-label="Aperçu horizontal des discussions"
          onPointerEnter={() => setPause(true)}
          onPointerLeave={() => setPause(false)}
          onFocus={() => setPause(true)}
          onBlur={() => setPause(false)}
        >
          <div className="forumAccueil__amorce" aria-hidden="true" />
          {discussions.map((discussion, index) => (
            <article className="forumApercu" key={discussion.id}>
              <div className="forumApercu__ordre"><span>{String(index + 1).padStart(2, "0")}</span><i />Sujet</div>
              <span className="forumApercu__categorie">{LIBELLES_CATEGORIES[discussion.category]}</span>
              <h3>{discussion.subject}</h3>
              <p>{raccourcir(discussion.body, 155)}</p>
              <div className="forumApercu__auteur"><strong>{discussion.display_name}</strong><span>{discussion.reponses.length} {discussion.reponses.length > 1 ? "réponses" : "réponse"}</span></div>
              {discussion.reponses.length > 0 && (
                <div className="forumApercu__reponses">
                  {discussion.reponses.slice(0, 2).map((reponse) => (
                    <div key={reponse.id}><span aria-hidden="true">↳</span><p><strong>{reponse.display_name}</strong>{raccourcir(reponse.body, 92)}</p></div>
                  ))}
                  {discussion.reponses.length > 2 && <small>+ {discussion.reponses.length - 2} autres réponses</small>}
                </div>
              )}
              <Link href={`/forum#discussion-${discussion.id}`}>Lire et participer <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
          {!chargement && discussions.length === 0 && (
            <article className="forumApercu forumApercu--vide">
              <span className="forumApercu__categorie">La conversation commence ici</span>
              <h3>Quel sujet technologique souhaitez-vous éclaircir&nbsp;?</h3>
              <p>Partagez votre question et donnez naissance à la première branche du Forum INOX.</p>
              <Link href="/forum">Ouvrir la première discussion <span aria-hidden="true">↗</span></Link>
            </article>
          )}
          {chargement && <div className="forumApercu forumApercu--chargement" aria-label="Chargement des discussions" />}
          <div className="forumAccueil__terminaison" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
