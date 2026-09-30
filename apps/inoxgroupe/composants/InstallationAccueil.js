"use client";

import Image from "next/image";

export default function InstallationAccueil() {
  return (
    <section className="section accueilInstallation" aria-labelledby="titre-installation-accueil">
      <div className="accueilInstallation__trame" aria-hidden="true" />
      <div className="conteneur accueilInstallation__cadre">
        <div className="accueilInstallation__texte">
          <span className="eyebrow">Vos ressources INOX toujours accessibles</span>
          <h2 id="titre-installation-accueil">Retrouvez les bons services.<br /><em>Sans perdre de temps.</em></h2>
          <p>Installez INOX sur votre écran d’accueil et retrouvez instantanément nos expertises, nos partenaires et les bons contacts pour faire avancer vos projets.</p>
          <div className="accueilInstallation__benefices" aria-label="Avantages de l’application INOX">
            <span>Accès immédiat</span>
            <span>Toujours à jour</span>
            <span>Expérience plein écran</span>
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new Event("inox:demander-installation"))}>
            Installer l’application <span aria-hidden="true">↓</span>
          </button>
        </div>

        <div className="accueilInstallation__visuel" aria-hidden="true">
          <div className="accueilInstallation__orbite accueilInstallation__orbite--une" />
          <div className="accueilInstallation__orbite accueilInstallation__orbite--deux" />
          <div className="accueilInstallation__telephone">
            <div className="accueilInstallation__statut">INOX CONNECT</div>
            <Image src="/icons/inox-app-192.png" width={112} height={112} alt="" />
            <strong>INOX</strong>
            <span>TECHNOLOGIES</span>
            <small>Votre accès direct</small>
          </div>
          <span className="accueilInstallation__badge accueilInstallation__badge--expertises">Expertises <b>04</b></span>
          <span className="accueilInstallation__badge accueilInstallation__badge--reseau">Réseau <b>PARTENAIRES</b></span>
          <span className="accueilInstallation__badge accueilInstallation__badge--contact">Contact <b>DIRECT</b></span>
        </div>
      </div>
    </section>
  );
}
