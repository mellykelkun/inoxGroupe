"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

const PREMIERE_APPARITION = 32 * 1000;
const DELAI_RAPPEL = 110 * 1000;
const CLE_PROCHAIN_RAPPEL = "inox-prochain-rappel-contact";

function detecterPlateforme() {
  const agent = window.navigator.userAgent;
  const appareilAppleMobile = /iPhone|iPad|iPod/i.test(agent)
    || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  if (appareilAppleMobile) return "apple";
  if (/Android/i.test(agent)) return "android";
  return "ordinateur";
}

function sansAbonnement() {
  return () => {};
}

export default function ContactFlottant() {
  const minuterie = useRef(null);
  const [visible, setVisible] = useState(false);
  const [ajoutContactLance, setAjoutContactLance] = useState(false);
  const plateforme = useSyncExternalStore(sansAbonnement, detecterPlateforme, () => "generique");

  const programmer = useCallback((delai) => {
    window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => {
      setVisible(true);
      try { window.sessionStorage.removeItem(CLE_PROCHAIN_RAPPEL); } catch {}
    }, Math.max(0, delai));
  }, []);

  useEffect(() => {
    let delai = PREMIERE_APPARITION;

    try {
      const prochainRappel = Number(window.sessionStorage.getItem(CLE_PROCHAIN_RAPPEL) || 0);
      if (prochainRappel > Date.now()) delai = prochainRappel - Date.now();
    } catch {}

    const afficherImmediatement = () => {
      window.clearTimeout(minuterie.current);
      setVisible(true);
    };

    programmer(delai);
    window.addEventListener("inox:afficher-contact", afficherImmediatement);

    return () => {
      window.clearTimeout(minuterie.current);
      window.removeEventListener("inox:afficher-contact", afficherImmediatement);
    };
  }, [programmer]);

  function masquerEtRappeler() {
    const prochainRappel = Date.now() + DELAI_RAPPEL;
    setVisible(false);
    try { window.sessionStorage.setItem(CLE_PROCHAIN_RAPPEL, String(prochainRappel)); } catch {}
    programmer(DELAI_RAPPEL);
  }

  const aideContact = {
    generique: {
      action: "Ouvrir la fiche contact",
      confirmation: "Fiche téléchargée — ouvrez-la",
      instruction: "Touchez le fichier téléchargé, choisissez Contacts ou Téléphone, puis confirmez l’enregistrement.",
      repli: "Vous ne voyez pas le fichier ? Télécharger à nouveau",
    },
    android: {
      action: "Ajouter avec Contacts",
      confirmation: "Fiche téléchargée — ouvrez-la",
      instruction: "Touchez Ouvrir ou la notification de téléchargement, choisissez Contacts ou Téléphone, puis touchez Enregistrer.",
      repli: "Pas de notification ? Télécharger à nouveau",
    },
    apple: {
      action: "Créer le contact INOX",
      confirmation: "Fiche ouverte — dernière étape",
      instruction: "La fiche s’ouvrira sur l’iPhone ou l’iPad. Touchez Créer un nouveau contact, puis Enregistrer.",
      repli: "La fiche ne s’est pas ouverte ? Télécharger à nouveau",
    },
    ordinateur: {
      action: "Importer la fiche contact",
      confirmation: "Fiche téléchargée — ouvrez-la",
      instruction: "Ouvrez le fichier téléchargé avec Contacts, Outlook ou Carnet d’adresses, puis confirmez l’importation.",
      repli: "Vous ne trouvez pas le fichier ? Télécharger à nouveau",
    },
  }[plateforme];

  if (!visible) return null;

  return (
    <aside className="contactFlottant" aria-label="Contacter INOX Technologies">
      <button className="contactFlottant__fermer" type="button" aria-label="Fermer le rappel de contact" onClick={masquerEtRappeler}>×</button>
      <div className="contactFlottant__entete">
        <span>Un expert à portée de main</span>
        <strong>Un projet à sécuriser ou à accélérer&nbsp;?</strong>
        <p>Expliquez-nous votre besoin. Nous vous aidons à identifier la prochaine décision utile.</p>
      </div>

      <div className="contactFlottant__actions">
        <a href="tel:+2250708201515" onClick={masquerEtRappeler}>Appeler maintenant <span aria-hidden="true">↗</span></a>
        <Link href="/#contact" onClick={masquerEtRappeler}>Présenter mon besoin</Link>
      </div>

      <div className="contactFlottant__coordonnees">
        <div>
          <span>Téléphone</span>
          <a href="tel:+2250708201515">+225 07 08 20 15 15</a>
          <a href="tel:+2250707950441">+225 07 07 95 04 41</a>
        </div>
        <div>
          <span>E-mail</span>
          <a href="mailto:contact@inox-group.net">contact@inox-group.net</a>
          <a href="mailto:fidelebo@inox-group.net">fidelebo@inox-group.net</a>
        </div>
        <address>Cocody, Angré 9e Tranche<br />Route CNPS · Abidjan, Côte d’Ivoire</address>
      </div>

      <div className="contactFlottant__carte">
        <div>
          <span>Gardez nos coordonnées</span>
          <strong>La carte INOX, toujours avec vous.</strong>
        </div>
        <div className="contactFlottant__carteActions">
          <a
            href="/cartes/contact-inox-technologies.vcf"
            download={plateforme === "apple" ? undefined : "contact-inox-technologies.vcf"}
            target={plateforme === "apple" ? "_blank" : undefined}
            rel={plateforme === "apple" ? "noreferrer" : undefined}
            onClick={() => setAjoutContactLance(true)}
          >
            {aideContact.action}
          </a>
          <a href="/cartes/carte-commerciale-inox-technologies.png" download>Télécharger la carte</a>
        </div>
        <p className={`contactFlottant__aideContact ${ajoutContactLance ? "contactFlottant__aideContact--active" : ""}`} aria-live="polite">
          <b>{ajoutContactLance ? aideContact.confirmation : "Comment procéder"}</b>
          {aideContact.instruction}
          {ajoutContactLance && <a href="/cartes/contact-inox-technologies.vcf" download>{aideContact.repli}</a>}
        </p>
      </div>
    </aside>
  );
}
