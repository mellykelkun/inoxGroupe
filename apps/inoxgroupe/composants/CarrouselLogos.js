"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const VITESSE_DEFILEMENT = 20;
const DELAI_REPRISE = 1800;

function GroupeLogos({ partenaires, copie = false }) {
  return (
    <div className="partenairesCarrousel__groupe" aria-hidden={copie ? "true" : undefined}>
      {partenaires.map((partenaire) => (
        <article className="partenaireLogo partenaireLogo--carrousel" key={`${copie ? "copie-" : ""}${partenaire.nom}`}>
          <Image
            className={`partenaireLogo__visuel ${partenaire.classe ?? ""}`}
            src={partenaire.logo}
            alt={copie ? "" : `Logo ${partenaire.nom}`}
            width={420}
            height={160}
            sizes="(max-width: 520px) 76vw, (max-width: 850px) 280px, 300px"
          />
          <span>{partenaire.nom}</span>
        </article>
      ))}
    </div>
  );
}

export default function CarrouselLogos({ partenaires, libelle }) {
  const fenetreRef = useRef(null);
  const interactionRef = useRef(false);
  const focusRef = useRef(false);
  const survolRef = useRef(false);
  const repriseRef = useRef(null);
  const [suspendu, setSuspendu] = useState(false);
  const [mouvementReduit, setMouvementReduit] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualiser = () => setMouvementReduit(media.matches);
    actualiser();
    media.addEventListener("change", actualiser);
    return () => media.removeEventListener("change", actualiser);
  }, []);

  useEffect(() => {
    const fenetre = fenetreRef.current;
    if (!fenetre || suspendu || mouvementReduit) return undefined;

    let animation;
    let precedent = performance.now();

    const defiler = (maintenant) => {
      const delta = Math.min(maintenant - precedent, 64);
      precedent = maintenant;

      if (!focusRef.current && !interactionRef.current && !survolRef.current && !document.hidden && fenetre.scrollWidth > fenetre.clientWidth) {
        fenetre.scrollLeft += (VITESSE_DEFILEMENT * delta) / 1000;
        const milieu = fenetre.scrollWidth / 2;
        if (fenetre.scrollLeft >= milieu) fenetre.scrollLeft -= milieu;
      }

      animation = window.requestAnimationFrame(defiler);
    };

    animation = window.requestAnimationFrame(defiler);
    return () => window.cancelAnimationFrame(animation);
  }, [mouvementReduit, suspendu]);

  useEffect(() => () => window.clearTimeout(repriseRef.current), []);

  const interrompre = () => {
    window.clearTimeout(repriseRef.current);
    interactionRef.current = true;
  };

  const reprendreApresInteraction = () => {
    window.clearTimeout(repriseRef.current);
    repriseRef.current = window.setTimeout(() => {
      interactionRef.current = false;
    }, DELAI_REPRISE);
  };

  const entrer = (event) => {
    if (event.pointerType === "mouse") survolRef.current = true;
  };

  const sortir = (event) => {
    if (event.pointerType === "mouse") survolRef.current = false;
  };

  const defilerManuellement = () => {
    interrompre();
    reprendreApresInteraction();
  };

  const prendreFocus = () => {
    focusRef.current = true;
  };

  const perdreFocus = () => {
    focusRef.current = false;
    reprendreApresInteraction();
  };

  return (
    <div className="partenairesCarrousel">
      <div className="partenairesCarrousel__commandes">
        <span>Glissez pour explorer</span>
        <button
          type="button"
          aria-pressed={suspendu}
          disabled={mouvementReduit}
          onClick={() => setSuspendu((valeur) => !valeur)}
        >
          {mouvementReduit ? "Défilement manuel" : suspendu ? "Reprendre" : "Pause"}
        </button>
      </div>
      <div
        ref={fenetreRef}
        className="partenairesCarrousel__fenetre"
        role="region"
        aria-label={libelle}
        tabIndex={0}
        onPointerEnter={entrer}
        onPointerLeave={sortir}
        onPointerDown={interrompre}
        onPointerUp={reprendreApresInteraction}
        onPointerCancel={reprendreApresInteraction}
        onWheel={defilerManuellement}
        onFocus={prendreFocus}
        onBlur={perdreFocus}
      >
        <div className="partenairesCarrousel__piste">
          <GroupeLogos partenaires={partenaires} />
          <GroupeLogos partenaires={partenaires} copie />
        </div>
      </div>
    </div>
  );
}
