"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const CLE_REPORT = "inox-installation-reportee";
const CLE_INSTALLEE = "inox-application-installee";
const DELAI_NOUVELLE_INVITATION = 3 * 24 * 60 * 60 * 1000;

function estAffichageApplication() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function estAppareilAppleMobile() {
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
    || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

function memoriserInstallation() {
  try { window.localStorage.setItem(CLE_INSTALLEE, String(Date.now())); } catch {}
  window.dispatchEvent(new CustomEvent("inox:etat-installation", { detail: { installee: true } }));
}

export default function ApplicationInox() {
  const invitation = useRef(null);
  const minuterie = useRef(null);
  const [visible, setVisible] = useState(false);
  const [instructions, setInstructions] = useState(null);

  const reporter = useCallback(() => {
    setVisible(false);
    setInstructions(null);
    try { window.localStorage.setItem(CLE_REPORT, String(Date.now())); } catch {}
  }, []);

  const installer = useCallback(async () => {
    if (estAffichageApplication()) {
      memoriserInstallation();
      setVisible(false);
      return;
    }

    const demande = invitation.current;
    if (!demande) {
      setInstructions(estAppareilAppleMobile() ? "apple" : "navigateur");
      setVisible(true);
      return;
    }

    await demande.prompt();
    const choix = await demande.userChoice;
    invitation.current = null;
    if (choix.outcome === "accepted") {
      memoriserInstallation();
      setVisible(false);
      return;
    }
    reporter();
  }, [reporter]);

  useEffect(() => {
    if (estAffichageApplication()) {
      memoriserInstallation();
      return undefined;
    }

    let invitationAutomatiqueAutorisee = true;
    try {
      const report = Number(window.localStorage.getItem(CLE_REPORT) || 0);
      invitationAutomatiqueAutorisee = Date.now() - report >= DELAI_NOUVELLE_INVITATION;
    } catch {}

    const reveler = () => {
      if (!invitationAutomatiqueAutorisee) return;
      window.clearTimeout(minuterie.current);
      minuterie.current = window.setTimeout(() => setVisible(true), 3200);
    };
    const preparerInstallation = (event) => {
      event.preventDefault();
      invitation.current = event;
      window.dispatchEvent(new CustomEvent("inox:etat-installation", { detail: { disponible: true } }));
      reveler();
    };
    const confirmerInstallation = () => {
      memoriserInstallation();
      setVisible(false);
      try { window.localStorage.removeItem(CLE_REPORT); } catch {}
    };
    const demanderInstallation = () => installer();

    window.addEventListener("beforeinstallprompt", preparerInstallation);
    window.addEventListener("appinstalled", confirmerInstallation);
    window.addEventListener("inox:demander-installation", demanderInstallation);
    if (estAppareilAppleMobile()) reveler();

    return () => {
      window.clearTimeout(minuterie.current);
      window.removeEventListener("beforeinstallprompt", preparerInstallation);
      window.removeEventListener("appinstalled", confirmerInstallation);
      window.removeEventListener("inox:demander-installation", demanderInstallation);
    };
  }, [installer]);

  if (!visible) return null;

  return (
    <aside className="installationInox" aria-label="Installer l’application INOX">
      <button className="installationInox__fermer" type="button" aria-label="Fermer cette invitation" onClick={reporter}>×</button>
      <Image className="installationInox__icone" src="/icons/inox-app-192.png" width={72} height={72} alt="" />
      <div className="installationInox__contenu">
        <span>Votre accès direct</span>
        <strong>INOX, à portée de main.</strong>
        <p>Retrouvez nos expertises, nos partenaires et nos contacts directement depuis votre écran d’accueil.</p>
        {instructions === "apple" && (
          <p className="installationInox__instructions">Touchez l’icône <b>Partager</b>, puis <b>Ajouter à l’écran d’accueil</b>.</p>
        )}
        {instructions === "navigateur" && (
          <p className="installationInox__instructions">Ouvrez le menu de votre navigateur, puis choisissez <b>Installer l’application</b>.</p>
        )}
        {!instructions && (
          <div className="installationInox__actions">
            <button type="button" onClick={installer}>Installer l’application <span aria-hidden="true">↓</span></button>
            <button type="button" onClick={reporter}>Plus tard</button>
          </div>
        )}
      </div>
    </aside>
  );
}
