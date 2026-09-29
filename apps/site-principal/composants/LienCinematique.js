"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function LienCinematique({ href, children, className = "", direction = "avant", variante = "standard", onClick, ...props }) {
  const router = useRouter();
  const chemin = usePathname();
  const navigationVerrouillee = useRef(false);
  const minuterieNavigation = useRef(null);
  const minuterieSecurite = useRef(null);
  const [transitionActive, setTransitionActive] = useState(false);
  const transitionPartenaires = variante === "partenaires"
    || chemin === "/partenaires"
    || String(href).split("#")[0] === "/partenaires";

  useEffect(() => () => {
    window.clearTimeout(minuterieNavigation.current);
    window.clearTimeout(minuterieSecurite.current);
  }, []);

  function naviguer(event) {
    const destination = new URL(String(href), window.location.href);
    const memePage = destination.pathname === window.location.pathname
      && destination.search === window.location.search;
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Next gère directement les ancres et les liens vers la page déjà ouverte.
    // Lancer l'écran de fermeture dans ces cas le laisserait monté sans changement de route.
    if (memePage || mouvementReduit) {
      return;
    }

    if (navigationVerrouillee.current) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    navigationVerrouillee.current = true;
    setTransitionActive(true);
    minuterieNavigation.current = window.setTimeout(() => {
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    }, 500);

    // Si le routeur est interrompu, l'écran ne doit jamais pouvoir rester bloqué.
    minuterieSecurite.current = window.setTimeout(() => {
      navigationVerrouillee.current = false;
      setTransitionActive(false);
    }, 1400);
  }

  return (
    <>
      <Link {...props} className={className} href={href} onClick={onClick} onNavigate={naviguer}>{children}</Link>
      {transitionActive && (
        <div className={`transitionCinema transitionCinema--${direction} ${transitionPartenaires ? "transitionCinema--partenaires" : ""}`} aria-hidden="true">
          <span>{transitionPartenaires ? "CONNEXIONS" : "INOX"}</span>
        </div>
      )}
    </>
  );
}
