"use client";

import { useEffect, useState } from "react";
import LogoInox from "./LogoInox";

const liensNavigation = [
  { href: "#solutions", libelle: "Solutions" },
  { href: "#services", libelle: "Services" },
  { href: "#apropos", libelle: "À propos" },
  { href: "#contact", libelle: "Contact" },
];

export default function Entete() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defilement, setDefilement] = useState(false);

  useEffect(() => {
    function suivreDefilement() {
      setDefilement(window.scrollY > 24);
    }

    window.addEventListener("scroll", suivreDefilement, { passive: true });
    return () => window.removeEventListener("scroll", suivreDefilement);
  }, []);

  function fermerMenu() {
    setMenuOuvert(false);
  }

  return (
    <header className={`entete ${defilement ? "entete--defile" : ""}`}>
      <div className="conteneur entete__interieur">
        <a className="marque" href="#accueil" aria-label="INOX Technologies, accueil">
          <LogoInox precharger />
        </a>
        <button className="boutonMenu" type="button" aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOuvert} onClick={() => setMenuOuvert(!menuOuvert)}>
          <span /><span />
        </button>
        <nav className={`navigation ${menuOuvert ? "navigation--ouverte" : ""}`} aria-label="Navigation principale">
          <a className="navigation__lien navigation__lien--actif" href="#accueil" onClick={fermerMenu}>Accueil</a>
          {liensNavigation.map((lien) => <a className="navigation__lien" href={lien.href} key={lien.href} onClick={fermerMenu}>{lien.libelle}</a>)}
          <a className="bouton bouton--petit bouton--sombre" href="#contact" onClick={fermerMenu}>Parler à un expert <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  );
}
