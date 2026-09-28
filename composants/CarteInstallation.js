"use client";

import Image from "next/image";

export default function CarteInstallation() {
  return (
    <section className="carteInstallation" aria-label="Accéder à l’application INOX">
      <div className="carteInstallation__halo" aria-hidden="true" />
      <Image className="carteInstallation__icone" src="/icons/inox-app-192.png" width={92} height={92} alt="" />
      <div className="carteInstallation__texte">
        <span>Votre accès privilégié</span>
        <h2>Emportez l’expertise INOX avec vous.</h2>
        <p>Nos expertises, nos partenaires et nos contacts restent accessibles directement depuis votre écran d’accueil.</p>
      </div>
      <button type="button" onClick={() => window.dispatchEvent(new Event("inox:demander-installation"))}>
        Installer l’application <span aria-hidden="true">↓</span>
      </button>
    </section>
  );
}
