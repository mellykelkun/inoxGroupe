"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navigation({ internal = false }: { internal?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const close = () => setOpen(false);
  const sectionHref = (anchor: string) => `${internal ? "/" : ""}#${anchor}`;

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <Link className="brand" href={internal ? "/" : "#accueil"} onClick={close} aria-label="INOX Technologies, accueil">
        <Image src="/images/inox-logo.png" alt="" width={68} height={68} priority />
      </Link>

      <nav className={`nav-links ${open ? "is-open" : ""}`} aria-label="Navigation principale">
        <Link href={sectionHref("journal")} onClick={close}>Le fil INOX</Link>
        <Link href={sectionHref("expertises")} onClick={close}>Expertises</Link>
        <Link href={sectionHref("solutions")} onClick={close}>Solutions</Link>
        <a className="nav-contact" href="https://inox-groupe.vercel.app/#contact" onClick={close}>Parler à un expert <span>↗</span></a>
      </nav>

      <button className={`menu-button ${open ? "is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}>
        <span /><span />
      </button>
    </header>
  );
}
