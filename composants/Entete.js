"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LienCinematique from "./LienCinematique";
import LogoInox from "./LogoInox";

const liensNavigation = [
  { href: "/#solutions", libelle: "Solutions" },
  { href: "/#services", libelle: "Services" },
  { href: "/#apropos", libelle: "À propos" },
  { href: "/#equipe", libelle: "Équipe" },
  { href: "/#contact", libelle: "Contact" },
];

export default function Entete() {
  const chemin = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defilement, setDefilement] = useState(false);
  const pageInterieure = chemin !== "/";

  useEffect(() => {
    function suivreDefilement() {
      setDefilement(window.scrollY > 24);
    }

    window.addEventListener("scroll", suivreDefilement, { passive: true });
    return () => window.removeEventListener("scroll", suivreDefilement);
  }, []);

  useEffect(() => {
    if (!menuOuvert) return undefined;

    function fermerAvecClavier(event) {
      if (event.key === "Escape") setMenuOuvert(false);
    }

    function adapterNavigation() {
      if (window.innerWidth > 1120) setMenuOuvert(false);
    }

    function fermerAuClicExterieur(event) {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(".navigation, .boutonMenu")) return;
      setMenuOuvert(false);
    }

    document.body.classList.add("menuNavigationOuvert");
    window.addEventListener("keydown", fermerAvecClavier);
    window.addEventListener("resize", adapterNavigation);
    document.addEventListener("pointerdown", fermerAuClicExterieur);

    return () => {
      document.body.classList.remove("menuNavigationOuvert");
      window.removeEventListener("keydown", fermerAvecClavier);
      window.removeEventListener("resize", adapterNavigation);
      document.removeEventListener("pointerdown", fermerAuClicExterieur);
    };
  }, [menuOuvert]);

  function fermerMenu() {
    setMenuOuvert(false);
  }

  function demanderInstallation() {
    fermerMenu();
    window.dispatchEvent(new Event("inox:demander-installation"));
  }

  function atteindreSectionAccueil(event, href) {
    event.preventDefault();
    const identifiant = href.split("#")[1];
    const section = document.getElementById(identifiant);
    if (!section) return;

    fermerMenu();
    document.body.classList.remove("menuNavigationOuvert");

    const ancre = `#${identifiant}`;
    if (window.location.hash !== ancre) window.history.pushState(null, "", ancre);

    window.requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <header className={`entete ${defilement || pageInterieure ? "entete--defile" : ""}`}>
      <div className="conteneur entete__interieur">
        <LienCinematique className="marque" href="/" direction="retour" aria-label="INOX Technologies, accueil">
          <LogoInox precharger />
        </LienCinematique>
        <button className="boutonMenu" type="button" aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOuvert} onClick={() => setMenuOuvert(!menuOuvert)}>
          <span /><span />
        </button>
        <button className={`navigationOverlay ${menuOuvert ? "navigationOverlay--visible" : ""}`} type="button" aria-label="Fermer le menu de navigation" onClick={fermerMenu} />
        <nav className={`navigation ${menuOuvert ? "navigation--ouverte" : ""}`} aria-label="Navigation principale">
          {pageInterieure ? (
            <LienCinematique className="navigation__lien" href="/" direction="retour" onClick={fermerMenu}>Accueil</LienCinematique>
          ) : (
            <a className="navigation__lien navigation__lien--actif" href="#accueil" onClick={fermerMenu}>Accueil</a>
          )}
          {liensNavigation.map((lien) => pageInterieure ? (
            <Link className="navigation__lien" href={lien.href} key={lien.href} onClick={fermerMenu}>{lien.libelle}</Link>
          ) : (
            <a className="navigation__lien" href={lien.href.slice(1)} key={lien.href} onClick={(event) => atteindreSectionAccueil(event, lien.href)}>{lien.libelle}</a>
          ))}
          <LienCinematique className={`navigation__lien ${chemin === "/partenaires" ? "navigation__lien--actif" : ""}`} href="/partenaires" variante="partenaires" aria-current={chemin === "/partenaires" ? "page" : undefined} onClick={fermerMenu}>Partenaires</LienCinematique>
          <LienCinematique className={`navigation__lien navigation__lien--ecosysteme ${chemin === "/ecosysteme" ? "navigation__lien--actif" : ""}`} href="/ecosysteme" aria-current={chemin === "/ecosysteme" ? "page" : undefined} onClick={fermerMenu}>Technologies</LienCinematique>
          <LienCinematique className={`boutonImmersion ${chemin === "/immersion-core" ? "boutonImmersion--actif" : ""}`} href="/immersion-core" aria-current={chemin === "/immersion-core" ? "page" : undefined} onClick={fermerMenu}>
            Immersion Core
            <span className="boutonImmersion__fleche" aria-hidden="true">→</span>
          </LienCinematique>
          <button className="navigationInstallation" type="button" onClick={demanderInstallation}>
            <Image src="/icons/inox-app-192.png" width={46} height={46} alt="" />
            <span>
              <small>Votre accès direct</small>
              <strong>
                <span className="navigationInstallation__court">Installer</span>
                <span className="navigationInstallation__long">Installer l’application INOX</span>
              </strong>
            </span>
            <i aria-hidden="true">↓</i>
          </button>
          {pageInterieure ? (
            <LienCinematique className="bouton bouton--petit bouton--sombre" href="/#contact" direction="retour" onClick={fermerMenu}>Parler à un expert <span aria-hidden="true">↗</span></LienCinematique>
          ) : (
            <a className="bouton bouton--petit bouton--sombre" href="#contact" onClick={fermerMenu}>Parler à un expert <span aria-hidden="true">↗</span></a>
          )}
        </nav>
      </div>
    </header>
  );
}
